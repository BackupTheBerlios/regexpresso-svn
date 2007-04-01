#!/bin/bash

REGEXPRESSO_DOXY_INPUT=../doc/doxygen/src
rm -rf $REGEXPRESSO_DOXY_INPUT
mkdir -p -v $REGEXPRESSO_DOXY_INPUT

for f in `cd ../src; find -iwholename "*.js"`; do perl js2doxy.pl ../src/$f > $REGEXPRESSO_DOXY_INPUT/$f; done
doxygen doxygen.cfg
