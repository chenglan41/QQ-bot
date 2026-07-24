copy .$config.json config.json
copy .$space.json space.json
rmdir /s node_modules
rmdir /s log
rmdir /s emotion && mkdir emotion
echo OK
pause