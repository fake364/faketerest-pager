#!/bin/bash

rm -rf ./dist
npx tsc
cp ./.env dist