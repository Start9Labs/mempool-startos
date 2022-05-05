#!/bin/bash
set -ea

_term() { 
  echo "Caught SIGTERM signal!" 
  kill -TERM "$backend_process" 2>/dev/null
  kill -TERM "$db_process" 2>/dev/null
  kill -TERM "$frontend_process" 2>/dev/null
#   kill -TERM "$configure" 2>/dev/null
}

# FRONTEND SETUP

__MEMPOOL_BACKEND_MAINNET_HTTP_HOST__=${BACKEND_MAINNET_HTTP_HOST:=127.0.0.1}
__MEMPOOL_BACKEND_MAINNET_HTTP_PORT__=${BACKEND_MAINNET_HTTP_PORT:=8999}
__MEMPOOL_FRONTEND_HTTP_PORT__=${FRONTEND_HTTP_PORT:=8080}

sed -i "s/__MEMPOOL_BACKEND_MAINNET_HTTP_HOST__/${__MEMPOOL_BACKEND_MAINNET_HTTP_HOST__}/g" /etc/nginx/conf.d/nginx-mempool.conf
sed -i "s/__MEMPOOL_BACKEND_MAINNET_HTTP_PORT__/${__MEMPOOL_BACKEND_MAINNET_HTTP_PORT__}/g" /etc/nginx/conf.d/nginx-mempool.conf

cp /etc/nginx/conf.d/nginx-mempool.conf /etc/nginx/nginx-mempool.conf
# rm /etc/nginx/sites-enabled/default
# /etc/init.d/nginx restart

cp /etc/nginx/nginx.conf /backend/nginx.conf
sed -i -e "s/__MEMPOOL_FRONTEND_HTTP_PORT__/${__MEMPOOL_FRONTEND_HTTP_PORT__}/g" -e "s/127.0.0.1://" -e "/listen/a\                server_name 127.0.0.1;" -e "s/listen 80/listen 8080/g" /backend/nginx.conf
cat /backend/nginx.conf > /etc/nginx/nginx.conf
# echo "daemon off;" >> /etc/nginx/nginx.conf

#  BACKEND SETUP

# read bitcoin proxy creds from start9 config
HOST_IP=$(ip -4 route list match 0/0 | awk '{print $3}')
# export ELECTRS=$(yq e '.electrs.enabled' /root/start9/config.yaml)
bitcoind_type=$(yq e '.bitcoind.type' /root/start9/config.yaml)
bitcoind_user=$(yq e '.bitcoind.user' /root/start9/config.yaml)
bitcoind_pass=$(yq e '.bitcoind.password' /root/start9/config.yaml)

if [ "$bitcoind_type" = "internal-proxy" ]; then
	bitcoind_host="btc-rpc-proxy.embassy"
	echo "Running on Bitcoin Proxy..."
else
	bitcoind_host="bitcoind.embassy"
	echo "Running on Bitcoin Core..."
fi
sed -i "s/CORE_RPC_HOST:=127.0.0.1/CORE_RPC_HOST:=$bitcoind_host/" start.sh
sed -i "s/CORE_RPC_USERNAME:=mempool/CORE_RPC_USERNAME:=$bitcoind_user/" start.sh
sed -i "s/CORE_RPC_PASSWORD:=mempool/CORE_RPC_PASSWORD:=$bitcoind_pass/" start.sh
if [ "$(yq ".enable-electrs" /root/start9/config.yaml)" = "true" ]; then
	sed -i 's/ELECTRUM_HOST:=127.0.0.1/ELECTRUM_HOST:=electrs.embassy/' start.sh
	sed -i 's/ELECTRUM_PORT:=50002/ELECTRUM_PORT:=50001/' start.sh
else
	# configure mempool to use just a bitcoind backend
	sed -i '/^node \/backend\/dist\/index.js/i jq \x27.MEMPOOL.BACKEND="none"\x27 \/backend\/mempool-config.json > \/backend\/mempool-config.json.tmp && mv \/backend\/mempool-config.json.tmp \/backend\/mempool-config.json' start.sh
	sed -i 's/MEMPOOL_BACKEND:=electrum/MEMPOOL_BACKEND:=none/' start.sh
fi
# DATABASE SETUP

if [ -d "/run/mysqld" ]; then
	echo "[i] mysqld already present, skipping creation"
	chown -R mysql:mysql /run/mysqld
else
	echo "[i] mysqld not found, creating...."
	mkdir -p /run/mysqld
	chown -R mysql:mysql /run/mysqld
fi

if [ -d /var/lib/mysql/mysql ]; then
	echo "[i] MySQL directory already present, skipping creation"
	chown -R mysql:mysql /var/lib/mysql
else
	echo "[i] MySQL data directory not found, creating initial DBs"

    mkdir -p /var/lib/mysql
	chown -R mysql:mysql /var/lib/mysql

	mysql_install_db --user=mysql --ldata=/var/lib/mysql > /dev/null

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

	/usr/sbin/mysqld --user=mysql --bootstrap --verbose=0 --skip-name-resolve --skip-networking=0 < $tfile

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

/usr/bin/mysqld_safe --user=mysql --datadir='/var/lib/mysql' &
    db_process=$!

# Properties 
echo 'Mempool Open Source Project.' > /root/start9/stats.yaml

# START UP
sed -i "s/user nobody;//g" /etc/nginx/nginx.conf
# wait-for.sh 127.0.0.1:3306 --timeout=720 -- nginx -g 'daemon off;' &
#     frontend_process=$!

nginx -g 'daemon off;' &
    frontend_process=$!

/backend/wait-for-it.sh 127.0.0.1:3306 --timeout=60 --strict -- /backend/start.sh
&
    backend_process=$!

echo 'All processes initalized'


# SIGTERM HANDLING
trap _term SIGTERM

wait -n $db_process $backend_process $frontend_process
# exec "$@"