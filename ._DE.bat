copy .$config.json config.json
copy .$var.json var.json
copy .$sealedContent.json sealedContent.json
rmdir /s node_modules
rmdir /s log
rmdir /s emotion && mkdir emotion
echo OK
pause