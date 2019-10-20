#!/bin/bash

echo -e "·▄▄▄▄  ▄▄▄ . ▄▄· ▄▄▄ . ▐ ▄ ▄▄▄▄▄▄▄▄   ▄▄▄· ▄▄▌  ▪  ·▄▄▄ ▄· ▄▌
██▪ ██ ▀▄.▀·▐█ ▌▪▀▄.▀·•█▌▐█•██  ▀▄ █·▐█ ▀█ ██•  ██ ▐▄▄·▐█▪██▌
▐█· ▐█▌▐▀▀▪▄██ ▄▄▐▀▀▪▄▐█▐▐▌ ▐█.▪▐▀▀▄ ▄█▀▀█ ██▪  ▐█·██▪ ▐█▌▐█▪
██. ██ ▐█▄▄▌▐███▌▐█▄▄▌██▐█▌ ▐█▌·▐█•█▌▐█ ▪▐▌▐█▌▐▌▐█▌██▌. ▐█▀·.
▀▀▀▀▀•  ▀▀▀ ·▀▀▀  ▀▀▀ ▀▀ █▪ ▀▀▀ .▀  ▀ ▀  ▀ .▀▀▀ ▀▀▀▀▀▀   ▀ •"

# Delete iExec outputs
rm -rf /iexec_out/*

# Netlify setup
export NETLIFY_REPO_URL=$1
DIST_FOLDER=/opt/buildhome/repo/$2
CMD=${@:3}

echo -e "\nBuilding your project…\n"
runuser -u buildbot build $CMD

if [[ ! -d $DIST_FOLDER ]]
then
  echo "ERROR: Output folder '$2' doesn't exist" && exit 1
fi

echo -e "\nDeploying to IPFS…\n"
runuser -u buildbot -- build npx ipfs-deploy $DIST_FOLDER 2>&1 | tee /opt/buildhome/ipfs-deploy.log

IPFS_ADDRESS=$(grep -o "/ipfs/[^ ]*/" /opt/buildhome/ipfs-deploy.log | uniq)

if [[ -z "$IPFS_ADDRESS" ]]
then
  echo "ERROR: IPFS deploy was unsuccessful" && exit 1
fi

echo -e "\nSuccess! $IPFS_ADDRESS\n"
echo $IPFS_ADDRESS > /iexec_out/ipfs-cid.txt 

echo -e "Thank you for using decentralify"