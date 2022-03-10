export MEMPOOL_VERSION=$(awk 'match($0,/version:[^ ]*/){ print substr($0, RSTART+9,5)}'  manifest.yaml | awk 'NR == 1')
echo 'v'$MEMPOOL_VERSION

# Old method of getting the Version number from mempool/mempool, does not work.
#git --git-dir=mempool/.git name-rev --tags --name-only $(git --git-dir=mempool/.git rev-parse HEAD) | sed 's|\([^\^]*\)\(\^0\)$|\1|g'