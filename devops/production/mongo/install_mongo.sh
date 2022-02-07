#!/bin/bash
apt update
apt install -y mongodb
systemctl status mongodb