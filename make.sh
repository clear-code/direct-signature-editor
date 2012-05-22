#!/bin/sh

appname=direct-signature-editor

cp buildscript/makexpi.sh ./
./makexpi.sh -n $appname -v
rm ./makexpi.sh
