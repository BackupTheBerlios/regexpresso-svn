@echo on

set REGEXPRESSO_DOXY_INPUT=regexpressodoxytmp
mkdir %REGEXPRESSO_DOXY_INPUT%

for %%f in (RegexWorker.js regexpresso.js) do perl js2doxy.pl ..\lib\%%f > %REGEXPRESSO_DOXY_INPUT%\%%f
doxygen .doxygen

pause
rmdir /s /q %REGEXPRESSO_DOXY_INPUT%