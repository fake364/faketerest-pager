#!/bin/bash

rm -rf ./dist
tsc
cp ./.env dist