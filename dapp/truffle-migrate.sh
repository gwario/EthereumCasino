#!/bin/sh
rm -vr build #saves so much trouble
truffle migrate --network ganache --reset
