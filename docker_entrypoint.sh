#!/bin/bash
set -ea

_term() {
  echo "Caught SIGTERM signal!"
  kill -TERM "$backend_process" 2>/dev/null
  kill -TERM "$db_process" 2>/dev/null
  kill -TERM "$frontend_process" 2>/dev/null
}

# FRONTEND SETUP

if [ "$(yq e ".lightning.type" /root/start9/config.yaml)" != "none" ]; then
  LIGHTNING_DETECTED_PORT=9735
fi
__MEMPOOL_BACKEND_MAINNET_HTTP_HOST__=${BACKEND_MAINNET_HTTP_HOST:=127.0.0.1}
__MEMPOOL_BACKEND_MAINNET_HTTP_PORT__=${BACKEND_MAINNET_HTTP_PORT:=8999}
__MEMPOOL_FRONTEND_HTTP_PORT__=${FRONTEND_HTTP_PORT:=8080}
__ACCELERATOR_BUTTON__=true
__SERVICES_API__="https://mempool.embassy/api/v1/services"

sed -i "s/__MEMPOOL_BACKEND_MAINNET_HTTP_HOST__/${__MEMPOOL_BACKEND_MAINNET_HTTP_HOST__}/g" /etc/nginx/conf.d/nginx-mempool.conf
sed -i "s/__MEMPOOL_BACKEND_MAINNET_HTTP_PORT__/${__MEMPOOL_BACKEND_MAINNET_HTTP_PORT__}/g" /etc/nginx/conf.d/nginx-mempool.conf

cp /etc/nginx/conf.d/nginx-mempool.conf /etc/nginx/nginx-mempool.conf

cp /etc/nginx/nginx.conf /backend/nginx.conf
sed -i -e "s/__MEMPOOL_FRONTEND_HTTP_PORT__/${__MEMPOOL_FRONTEND_HTTP_PORT__}/g" -e "s/127.0.0.1://" -e "/listen/a\                server_name 127.0.0.1;" -e "s/listen 80/listen 8080/g" /backend/nginx.conf
cat /backend/nginx.conf > /etc/nginx/nginx.conf
/patch/entrypoint.sh

#  BACKEND SETUP

# read bitcoin creds from start9 config
HOST_IP=$(ip -4 route list match 0/0 | awk '{print $3}')
bitcoind_user=$(yq e '.bitcoin-user' /root/start9/config.yaml)
bitcoind_pass=$(yq e '.bitcoin-password' /root/start9/config.yaml)
bitcoind_host="bitcoind.embassy"
__MEMPOOL_SERVICES_API__="https://mempool.embassy/api/v1/services"

sed -i "s/CORE_RPC_HOST:=127.0.0.1/CORE_RPC_HOST:=$bitcoind_host/" start.sh
sed -i "s/CORE_RPC_USERNAME:=mempool/CORE_RPC_USERNAME:=$bitcoind_user/" start.sh
sed -i "s/CORE_RPC_PASSWORD:=mempool/CORE_RPC_PASSWORD:=$bitcoind_pass/" start.sh

# adjust heap size
sed -i "s/node \/backend\/package\/index.js/node --max-old-space-size=16384 \/backend\/package\/index.js/" start.sh

# Configure mempool to set lightning to true if lightning is enabled
if [ "$(yq e ".lightning.type" /root/start9/config.yaml)" = "none" ]; then
	sed -i 's/LIGHTNING_ENABLED:=true/LIGHTNING_ENABLED:=false/' start.sh
	echo "Lightning tab disabled..."
else
	sed -i 's/LIGHTNING_ENABLED:=false/LIGHTNING_ENABLED:=true/' start.sh
	echo "Lightning tab enabled..."
fi

# Allow user to choose between LND and CLN nodes for lightning
if [ "$(yq e ".lightning.type" /root/start9/config.yaml)" = "lnd" ]; then
	sed -i 's/LIGHTNING_BACKEND:=\"cln\"/LIGHTNING_BACKEND:=\"lnd\"/' start.sh
	sed -i 's/LND_TLS_CERT_PATH:=\"\"/LND_TLS_CERT_PATH:=\"\/mnt\/lnd\/tls.cert\"/' start.sh
	sed -i 's/LND_MACAROON_PATH:=\"\"/LND_MACAROON_PATH:=\"\/mnt\/lnd\/readonly.macaroon\"/' start.sh
	sed -i 's/LND_REST_API_URL:=\"https:\/\/localhost:8080\"/LND_REST_API_URL:=\"https:\/\/lnd.embassy:8080\"/' start.sh
	echo "Running on LND..."
elif [ "$(yq e ".lightning.type" /root/start9/config.yaml)" = "cln" ]; then
	sed -i 's/LIGHTNING_BACKEND:=\"lnd\"/LIGHTNING_BACKEND:=\"cln\"/' start.sh
	sed -i 's/CLIGHTNING_SOCKET:=\"\"/CLIGHTNING_SOCKET:=\"\/mnt\/c-lightning\/lightning-rpc\"/' start.sh
	echo "Running on Core Lightning..."
fi

# Allow user to choose between Electrs, Fulcrum as Indexer
if [ "$(yq e ".indexer.type" /root/start9/config.yaml)" = "electrs" ]; then
	sed -i 's/ELECTRUM_HOST:=127.0.0.1/ELECTRUM_HOST:=electrs.embassy/' start.sh
	sed -i 's/ELECTRUM_PORT:=50002/ELECTRUM_PORT:=50001/' start.sh
	echo "Running with Electrs..."
elif [ "$(yq e ".indexer.type" /root/start9/config.yaml)" = "fulcrum" ]; then
	sed -i 's/ELECTRUM_HOST:=127.0.0.1/ELECTRUM_HOST:=fulcrum.embassy/' start.sh
	sed -i 's/ELECTRUM_PORT:=50002/ELECTRUM_PORT:=50001/' start.sh
	echo "Running with Fulcrum..."
else
	# configure mempool to use just a bitcoind backend
	sed -i '/^node \/backend\/dist\/index.js/i jq \x27.MEMPOOL.BACKEND="none"\x27 \/backend\/mempool-config.json > \/backend\/mempool-config.json.tmp && mv \/backend\/mempool-config.json.tmp \/backend\/mempool-config.json' start.sh
	sed -i 's/MEMPOOL_BACKEND:=electrum/MEMPOOL_BACKEND:=none/' start.sh
fi

# DATABASE SETUP
MYSQL_DATADIR="/var/lib/mysql"
UPGRADE_MARKER="$MYSQL_DATADIR/.upgrade_done"
MYSQL_DIR="/var/run/mysqld"
MYSQL_SOCKET="$MYSQL_DIR/mysqld.sock"

if [ -d "$MYSQL_DIR" ]; then
	echo "[i] mysqld already present, skipping creation"
	chown -R mysql:mysql $MYSQL_DIR
else
	echo "[i] mysqld not found, creating...."
	mkdir -p $MYSQL_DIR
	chown -R mysql:mysql $MYSQL_DIR
fi

# Initialize the database if not already initialized
if [ ! -d "$MYSQL_DATADIR/mysql" ]; then
	echo "Initializing MariaDB data directory..."
	mariadb-install-db --user=mysql --datadir="$MYSQL_DATADIR" > /dev/null
	chown -R mysql:mysql "$MYSQL_DATADIR"
	chmod -R 755 "$MYSQL_DATADIR"
	touch "$UPGRADE_MARKER"  # Skip upgrade on initial boot

	if [ "$MYSQL_ROOT_PASSWORD" = "" ]; then
		MYSQL_ROOT_PASSWORD=`pwgen 16 1`
		echo "[i] MySQL root Password: $MYSQL_ROOT_PASSWORD"
		export MYSQL_ROOT_PASSWORD
	fi

	MYSQL_DATABASE=${MYSQL_DATABASE:-"mempool"}
	MYSQL_USER=${MYSQL_USER:-"mempool"}
	MYSQL_PASSWORD=${MYSQL_PASSWORD:-"mempool"}

	tfile=`mktemp`
	if [ ! -f "$tfile" ]; then
	    return 1
	fi

	cat << EOF > $tfile
USE mysql;
FLUSH PRIVILEGES ;
GRANT ALL ON *.* TO 'root'@'%' identified by '$MYSQL_ROOT_PASSWORD' WITH GRANT OPTION ;
GRANT ALL ON *.* TO 'root'@'localhost' identified by '$MYSQL_ROOT_PASSWORD' WITH GRANT OPTION ;
SET PASSWORD FOR 'root'@'localhost'=PASSWORD('${MYSQL_ROOT_PASSWORD}') ;
DROP DATABASE IF EXISTS test ;
FLUSH PRIVILEGES ;
EOF

	if [ "$MYSQL_DATABASE" != "" ]; then
		echo "[i] Creating database: $MYSQL_DATABASE"
		echo "[i] with character set: 'utf8' and collation: 'utf8_general_ci'"
		echo "CREATE DATABASE IF NOT EXISTS \`$MYSQL_DATABASE\` CHARACTER SET utf8 COLLATE utf8_general_ci;" >> $tfile

	if [ "$MYSQL_USER" != "" ]; then
		echo "[i] Creating user: $MYSQL_USER with password $MYSQL_PASSWORD"
		echo "GRANT ALL ON \`$MYSQL_DATABASE\`.* to '$MYSQL_USER'@'%' IDENTIFIED BY '$MYSQL_PASSWORD';" >> $tfile
		echo "GRANT ALL ON \`$MYSQL_DATABASE\`.* to '$MYSQL_USER'@'localhost' IDENTIFIED BY '$MYSQL_PASSWORD';" >> $tfile
        echo "FLUSH PRIVILEGES;" >> $tfile
	    fi
	fi

	/usr/sbin/mysqld --user=mysql --datadir="$MYSQL_DATADIR" --bootstrap --verbose=0 --skip-name-resolve --skip-networking=0 < $tfile

	rm -f $tfile

	for f in /docker-entrypoint-initdb.d/*; do
		case "$f" in
			*.sql)    echo "$0: running $f"; /usr/sbin/mysqld --user=mysql --bootstrap --verbose=0 --skip-name-resolve --skip-networking=0 < "$f"; echo ;;
			*.sql.gz) echo "$0: running $f"; gunzip -c "$f" | /usr/sbin/mysqld --user=mysql --bootstrap --verbose=0 --skip-name-resolve --skip-networking=0 < "$f"; echo ;;
			*)        echo "$0: ignoring or entrypoint initdb empty $f" ;;
		esac
		echo
	done

	echo
	echo 'MySQL init process done. Starting mysqld...'
	echo
fi

chown -R mysql:mysql "$MYSQL_DATADIR"
chmod -R 755 "$MYSQL_DATADIR"

# Run mysql_upgrade once
if [ -d "$MYSQL_DATADIR/mysql" ] && [ ! -f "$UPGRADE_MARKER" ]; then
	echo "Starting MariaDB for upgrade..."
	mariadbd --user=mysql --datadir="$MYSQL_DATADIR" --skip-grant-tables &
	# Wait for server to start up
	echo "Waiting for MariaDB to start..."
	until mysqladmin -u root ping; do
		sleep 2
	done
	# Switch to unix socket for auth
	mysql --socket="$MYSQL_SOCKET" <<EOF
FLUSH PRIVILEGES;
ALTER USER 'root'@'localhost' IDENTIFIED VIA unix_socket;
ALTER USER 'root'@'%' IDENTIFIED VIA unix_socket;
FLUSH PRIVILEGES;
EOF
	echo "Running mysql_upgrade..."
	mysql_upgrade -u root --protocol=SOCKET --socket=/run/mysqld/mysqld.sock
	touch "$UPGRADE_MARKER"
	echo "Shutting down MariaDB post upgrade..."
	mysqladmin -u root shutdown
else
	echo "No upgrade needed or already completed."
fi

# Start MariaDB
mariadbd --user=mysql --datadir="$MYSQL_DATADIR" &
db_process=$!

# START UP
sed -i "s/user nobody;//g" /etc/nginx/nginx.conf

nginx -g 'daemon off;' &
frontend_process=$!

/backend/wait-for-it.sh localhost:3306 --timeout=720 --strict -- ./start.sh &
backend_process=$!

echo 'All processes initalized'

# SIGTERM HANDLING
trap _term SIGTERM

wait -n $db_process $backend_process $frontend_process
