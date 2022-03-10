#!/bin/bash
set -ea

_term() { 
  echo "Caught SIGTERM signal!" 
  kill -TERM "$backend_process" 2>/dev/null
  kill -TERM "$db_process" 2>/dev/null
  kill -TERM "$frontend_process" 2>/dev/null
  kill -TERM "$mempool_child" 2>/dev/null
}
# FRONTEND SETUP
__MEMPOOL_BACKEND_MAINNET_HTTP_HOST__=${BACKEND_MAINNET_HTTP_HOST:=127.0.0.1}
__MEMPOOL_BACKEND_MAINNET_HTTP_PORT__=${BACKEND_MAINNET_HTTP_PORT:=8999}
__MEMPOOL_FRONTEND_HTTP_PORT__=${FRONTEND_HTTP_PORT:=8080}
sed -i "s/__MEMPOOL_BACKEND_MAINNET_HTTP_HOST__/${__MEMPOOL_BACKEND_MAINNET_HTTP_HOST__}/g" /etc/nginx/conf.d/nginx-mempool.conf
sed -i "s/__MEMPOOL_BACKEND_MAINNET_HTTP_PORT__/${__MEMPOOL_BACKEND_MAINNET_HTTP_PORT__}/g" /etc/nginx/conf.d/nginx-mempool.conf
cp /etc/nginx/conf.d/nginx-mempool.conf /etc/nginx/nginx-mempool.conf
cp /etc/nginx/nginx.conf /backend/nginx.conf
sed -i "s/__MEMPOOL_FRONTEND_HTTP_PORT__/${__MEMPOOL_FRONTEND_HTTP_PORT__}/g" /backend/nginx.conf
cat /backend/nginx.conf > /etc/nginx/nginx.conf

#  BACKEND SETUP
echo -e 'setting variables...'
# read bitcoin proxy creds from start9 config
export HOST_IP=$(ip -4 route list match 0/0 | awk '{print $3}')
export LAN_ADDRESS=$(yq e '.lan-address' /root/start9/config.yaml)
export RPC_USER=$(yq e '.bitcoin.bitcoind-rpc.rpc-user' /root/start9/config.yaml)
export RPC_PASS=$(yq e '.bitcoin.bitcoind-rpc.rpc-password' /root/start9/config.yaml)
# configure mempool to use just a bitcoind backend
# echo -e 'Modifying start.sh...'
# sed -i '/^node \/backend\/dist\/index.js/i jq \x27.MEMPOOL.BACKEND="none"\x27 \/backend\/mempool-config.json > \/backend\/mempool-config.json.tmp && mv \/backend\/mempool-config.json.tmp \/backend\/mempool-config.json' start.sh
# sed -i 's/CORE_RPC_HOST:=127.0.0.1/CORE_RPC_HOST:=btc-rpc-proxy.embassy/' start.sh
# sed -i 's/MEMPOOL_BACKEND:=electrum/MEMPOOL_BACKEND:=none/' start.sh
# sed -i 's/CORE_RPC_USERNAME:=mempool/CORE_RPC_USERNAME:='$RPC_USER'/' start.sh
# sed -i 's/CORE_RPC_PASSWORD:=mempool/CORE_RPC_PASSWORD:='$RPC_PASS'/' start.sh
echo -e 'Modifying mempool-config.json...'
sed -i -e '1,4 s/electrum/none/' -e '20,28 s/127.0.0.1/btc-rpc-proxy.embassy/' -e '20,28 s/"USERNAME": "mempool"/"USERNAME": "'$RPC_USER'"/' -e '20,28 s/"PASSWORD": "mempool"/"PASSWORD": "'$RPC_PASS'"/' mempool-config.json
sed -i '29,33 s/true/false/' mempool-config.json

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
DROP DATABASE IF EXISTS mempool ;
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
/usr/bin/mysqld_safe --user=mysql --datadir='/var/lib/mysql' & db_process=$!

# START UP
npm run start & mempool_child=$!
sed -i "s/user nobody;//g" /etc/nginx/nginx.conf
nginx -g 'daemon off;' & frontend_process=$!
# replace example.com with your domain name
# certbot --nginx -d $LAN_ADDRESS
echo 'All processes initalized'

# ERROR HANDLING
trap _term SIGTERM
wait -n $mempool_child
