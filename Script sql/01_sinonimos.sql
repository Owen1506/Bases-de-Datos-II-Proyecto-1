-- 01_sinonimos.sql
-- Sinonimos de las tablas, los SP usan estos nombres en vez de las tablas
USE WideWorldImporters;
GO

IF NOT EXISTS (SELECT 1 FROM sys.schemas WHERE name = 'syn')
    EXEC('CREATE SCHEMA syn');
GO

-- Clientes
DROP SYNONYM IF EXISTS syn.Customers;
CREATE SYNONYM syn.Customers FOR Sales.Customers;

DROP SYNONYM IF EXISTS syn.CustomerCategories;
CREATE SYNONYM syn.CustomerCategories FOR Sales.CustomerCategories;

DROP SYNONYM IF EXISTS syn.BuyingGroups;
CREATE SYNONYM syn.BuyingGroups FOR Sales.BuyingGroups;

DROP SYNONYM IF EXISTS syn.DeliveryMethods;
CREATE SYNONYM syn.DeliveryMethods FOR Application.DeliveryMethods;

DROP SYNONYM IF EXISTS syn.People;
CREATE SYNONYM syn.People FOR Application.People;

DROP SYNONYM IF EXISTS syn.Cities;
CREATE SYNONYM syn.Cities FOR Application.Cities;

DROP SYNONYM IF EXISTS syn.StateProvinces;
CREATE SYNONYM syn.StateProvinces FOR Application.StateProvinces;
GO
