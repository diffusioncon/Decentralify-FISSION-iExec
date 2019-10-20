#!/bin/bash

BASE_PATH=$(pwd)

DIR_IN=`pwd`/iexec_in
DIR_OUT=`pwd`/iexec_out
DOCKERIMAGE=maggo/decentralify:v0.1
CMDLINE='https://github.com/maggo/decentralify.git build yarn run build'

docker run --rm \
  -v ${DIR_IN}:/iexec_in \
  -v ${DIR_OUT}:/iexec_out \
  -v ${BASE_PATH}/build.sh:/usr/local/bin/build-decentralized \
  ${DOCKERIMAGE} ${CMDLINE}