:: This is for testing. Use actual batch file on prod server


@echo off
echo Stopping Jitterbit Services...
echo ------------------------------------------------------------------------------
echo.
echo.

:: <Req Admin>
:: ------------------------------------------------------------

:: Check for permissions
>nul 2>&1 "%SYSTEMROOT%\system32\cacls.exe" "%SYSTEMROOT%\system32\config\system"
:: If error flag set, we do not have admin.
if '%errorlevel%' NEQ '0' (
Echo Not running with required administrative priviledges:
Echo Requesting administrative privileges now...
echo.
echo ******************************************************************************
echo Please click Yes on the displayed 'User Account Control' prompt:
echo 'Do you want to allow the following program to make changes to this computer?'
echo.
echo Click Yes Now
echo ******************************************************************************
goto UACPrompt
) else ( goto gotAdmin )
:UACPrompt
Echo Set UAC = CreateObject^("Shell.Application"^) > "%temp%\getadmin.vbs"
Echo UAC.ShellExecute "%~s0", "", "", "runas", 1 >> "%temp%\getadmin.vbs"
"%temp%\getadmin.vbs"
Exit /B
:gotAdmin
if exist "%temp%\getadmin.vbs" ( Del "%temp%\getadmin.vbs" )
Pushd "%CD%"
CD /D "%~dp0"

:: </Req Admin>
:: ------------------------------------------------------------

sc stop "Jitterbit Scheduler"
if errorlevel 1 (
  if %errorlevel% NEQ 1062 (
    goto error
  )
)

sc stop "Jitterbit Cleanup"
if errorlevel 1 (
  if %errorlevel% NEQ 1062 (
    goto error
  )
)

sc stop "Jitterbit Tomcat Server"
if errorlevel 1 (
  if %errorlevel% NEQ 1062 (
    goto error
  )
)

sc stop "Jitterbit Apache Server"
if errorlevel 1 (
  if %errorlevel% NEQ 1062 (
    goto error
  )
)

sc stop "Jitterbit Process Engine"
if errorlevel 1 (
  if %errorlevel% NEQ 1062 (
    goto error
  )
)

sc stop "Jitterbit-Verbose-Log-Shipper" 
if errorlevel 1 (
  if %errorlevel% NEQ 1062 (
    goto error
  )
)

echo.
echo.
echo ------------------------------------------------------------------------------
echo.
echo Jitterbit Services Stopped Successfully!
echo.
goto end

:error
echo.
echo.
echo ------------------------------------------------------------------------------
echo.
echo Unable to stop Jitterbit services.
echo Error Code: %errorlevel%
echo.
echo Often this happens because you are not running with Administrator permissions.
echo In most Windows environments, this can be fixed by doing the following:
echo ------------------------------------------------------------------------------
echo * Right-click on the 'Stop Jitterbit Services' shortcut in the start menu
echo * Select 'Run as Administrator' from the popup menu
echo.
echo If the above does not fix the issue-
echo   Please contact your system administrator and
echo   ask how you can obtain Administrator privilages
echo.

:end
echo.
echo ------------------------------------------------------------------------------
PAUSE
