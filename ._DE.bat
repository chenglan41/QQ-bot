copy .$config.json config.json
copy .$var.json var.json
copy .$sealedMemory.json sealedMemory.json
rmdir /s node_modules
rmdir /s log
rmdir /s emotion && mkdir emotion
echo OK
pause