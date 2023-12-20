@echo off
sequelize-auto -h localhost -d FitStoreDB  -u j2nd  -p 1433 -x 1234$ --dialect mssql -o "./model"
pause