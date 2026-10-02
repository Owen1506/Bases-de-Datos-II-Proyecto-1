-- 99_ejemplos_ejecucion.sql
-- Ejemplos de como se ejecutan los SP
USE WideWorldImporters;
GO

-- Catalogos
EXEC dbo.usp_Catalogo_CategoriasCliente;
EXEC dbo.usp_Catalogo_MetodosEntrega;

-- Clientes
EXEC dbo.usp_Clientes_Listar;
EXEC dbo.usp_Clientes_Listar @Nombre = 'toys';
EXEC dbo.usp_Clientes_Listar @CategoriaID = 4;
EXEC dbo.usp_Clientes_Listar @Nombre = 'toys', @CategoriaID = 3, @MetodoEntregaID = 3;

EXEC dbo.usp_Clientes_Detalle @ClienteID = 1;
GO
