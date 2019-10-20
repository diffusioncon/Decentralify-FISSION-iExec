#!/bin/bash

BASE_PATH=$(pwd)

DIR_IN=`pwd`/iexec_in
DIR_OUT=`pwd`/iexec_out
DOCKERIMAGE=979879a2ab36
CMDLINE='https://github.com/maggo/mar.co.de.git dist yarn run build'

docker run --rm \
  -v ${DIR_IN}:/iexec_in \
  -v ${DIR_OUT}:/iexec_out \
  -v ${BASE_PATH}/build.sh:/usr/local/bin/build-decentralized \
  ${DOCKERIMAGE} ${CMDLINE}