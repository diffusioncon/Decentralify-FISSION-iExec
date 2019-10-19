#!/bin/bash

# Delete iExec outputs
rm -rf /iexec_out/*

# Netlify setup
export NETLIFY_REPO_URL=$1
DIST_FOLDER=/opt/buildhome/repo/$2

echo "Building your project"
build "${@:3}"

if [[ ! -d $DIST_FOLDER ]]; then
  echo "ERROR: Output folder '$2' doesn't exist"
  exit 1
fi

echo "Copying output folder to iExec output"
cp -R $DIST_FOLDER/* /iexec_out/