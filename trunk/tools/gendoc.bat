@echo on

set REGEXPRESSO_DOXY_INPUT=..\doc\doxygen\src
mkdir %REGEXPRESSO_DOXY_INPUT%

for %%f in (RegexWorker.js regexpresso.js) do perl js2doxy.pl ..\src\%%f > %REGEXPRESSO_DOXY_INPUT%\%%f
doxygen doxygen.cfg

pause
rmdir /s /q %REGEXPRESSO_DOXY_INPUT%