#!/bin/bash

# mount --bind /var/tmp/root.x86_64 /mnt

# We have TTY, so probably an interactive container...
if test -t 0; then
  # Run supervisord detached...
  supervisord -c /etc/supervisord.conf
  # Some command(s) has been passed to container? Execute them and exit.
  # No commands provided? Run bash.
  if [[ $@ ]]; then 
    node_modules/.bin/mocha $@
  else 
    export PS1='[\u@\h : \w]\$ '
    /bin/bash
  fi
# Detached mode
else
  # Run supervisord in foreground, which will stay until container is stopped.
  supervisord -c /etc/supervisord.conf
  npm test
fi
