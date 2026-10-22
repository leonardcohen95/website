#!/bin/bash
kubectl delete pv app-data --ignore-not-found >/dev/null 2>&1
true