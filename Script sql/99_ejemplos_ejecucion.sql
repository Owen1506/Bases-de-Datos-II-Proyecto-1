-- 99_ejemplos_ejecucion.sql
-- Ejemplos de como se ejecutan los SP
USE WideWorldImporters;
GO

-- Catalogos
EXEC dbo.usp_Catalogo_CategoriasCliente;
EXEC dbo.usp_Catalogo_MetodosEntrega;
EXEC dbo.usp_Catalogo_GruposCompra;
EXEC dbo.usp_Catalogo_BuscarCiudades @Texto = 'Lisc';
EXEC dbo.usp_Catalogo_BuscarPersonas @Texto = 'Waldemar';
EXEC dbo.usp_Catalogo_BuscarClientes @Texto = 'Head Office';

-- Clientes
EXEC dbo.usp_Clientes_Listar;
EXEC dbo.usp_Clientes_Listar @Nombre = 'toys';
EXEC dbo.usp_Clientes_Listar @CategoriaID = 4;
EXEC dbo.usp_Clientes_Listar @Nombre = 'toys', @CategoriaID = 3, @MetodoEntregaID = 3;
EXEC dbo.usp_Clientes_Listar @Nombre = 'toys', @Pagina = 3;

EXEC dbo.usp_Clientes_Detalle @ClienteID = 1;
GO

-- CRUD de clientes: se crea un cliente, se edita y se elimina
-- (sin @ClienteFacturarID el cliente se factura a si mismo)
DECLARE @nuevo TABLE (ClienteID INT);
DECLARE @id INT;

INSERT @nuevo EXEC dbo.usp_Clientes_Insertar
    @Nombre = 'Cliente Ejemplo', @CategoriaID = 3,
    @ContactoPrimarioID = 1001, @MetodoEntregaID = 3, @CiudadEntregaID = 19586, @CiudadPostalID = 19586,
    @DiasPago = 7, @Telefono = '(308) 555-0199', @Fax = '(308) 555-0198', @SitioWeb = 'http://www.ejemplo.com',
    @DireccionEntrega1 = 'Shop 1', @CodigoPostalEntrega = '90410', @DireccionPostal1 = 'PO Box 1',
    @CodigoPostalPostal = '90410', @Latitud = 41.5, @Longitud = -102.6;
SELECT @id = ClienteID FROM @nuevo;

EXEC dbo.usp_Clientes_Actualizar
    @ClienteID = @id, @Nombre = 'Cliente Ejemplo Editado', @ClienteFacturarID = @id, @CategoriaID = 4,
    @ContactoPrimarioID = 1001, @MetodoEntregaID = 3, @CiudadEntregaID = 19586, @CiudadPostalID = 19586,
    @DiasPago = 14, @Telefono = '(308) 555-0199', @Fax = '(308) 555-0198', @SitioWeb = 'http://www.ejemplo.com',
    @DireccionEntrega1 = 'Shop 1', @CodigoPostalEntrega = '90410', @DireccionPostal1 = 'PO Box 1',
    @CodigoPostalPostal = '90410', @Latitud = 41.5, @Longitud = -102.6;

EXEC dbo.usp_Clientes_Detalle @ClienteID = @id;
EXEC dbo.usp_Clientes_Eliminar @ClienteID = @id;

-- Este falla a proposito: el cliente 1 tiene ventas asociadas
EXEC dbo.usp_Clientes_Eliminar @ClienteID = 1;
GO

-- Este falla a proposito: un cliente sin grupo de compra no puede facturarle a Tailspin
EXEC dbo.usp_Clientes_Insertar
    @Nombre = 'Cliente Ejemplo 2', @ClienteFacturarID = 1, @CategoriaID = 3,
    @ContactoPrimarioID = 1001, @MetodoEntregaID = 3, @CiudadEntregaID = 19586, @CiudadPostalID = 19586,
    @DiasPago = 7, @Telefono = '(308) 555-0199', @Fax = '(308) 555-0198', @SitioWeb = 'http://www.ejemplo.com',
    @DireccionEntrega1 = 'Shop 1', @CodigoPostalEntrega = '90410', @DireccionPostal1 = 'PO Box 1',
    @CodigoPostalPostal = '90410';
GO

-- Proveedores
EXEC dbo.usp_Catalogo_CategoriasProveedor;
EXEC dbo.usp_Proveedores_Listar;
EXEC dbo.usp_Proveedores_Listar @Nombre = 'pub';
EXEC dbo.usp_Proveedores_Listar @CategoriaID = 2;
EXEC dbo.usp_Proveedores_Listar @Pagina = 2;
EXEC dbo.usp_Proveedores_Detalle @ProveedorID = 2;
GO

-- CRUD de proveedores: se crea un proveedor, se edita y se elimina
DECLARE @nuevoProveedor TABLE (ProveedorID INT);
DECLARE @idProveedor INT;

INSERT @nuevoProveedor EXEC dbo.usp_Proveedores_Insertar
    @Nombre = 'Proveedor Ejemplo', @CategoriaID = 2, @ContactoPrimarioID = 1001, @ContactoAlternativoID = 1002,
    @MetodoEntregaID = 7, @CiudadEntregaID = 19586, @CiudadPostalID = 19586, @NombreBanco = 'Woodgrove Bank Lisco',
    @NumeroCuenta = '1234567890', @DiasPago = 30, @Telefono = '(308) 555-0111', @Fax = '(308) 555-0112',
    @SitioWeb = 'http://www.proveedor.com', @DireccionEntrega1 = 'Suite 1', @CodigoPostalEntrega = '90410',
    @DireccionPostal1 = 'PO Box 1', @CodigoPostalPostal = '90410';
SELECT @idProveedor = ProveedorID FROM @nuevoProveedor;

EXEC dbo.usp_Proveedores_Actualizar
    @ProveedorID = @idProveedor, @Nombre = 'Proveedor Ejemplo Editado', @CategoriaID = 2, @ContactoPrimarioID = 1001,
    @ContactoAlternativoID = 1002, @MetodoEntregaID = 7, @CiudadEntregaID = 19586, @CiudadPostalID = 19586,
    @NombreBanco = 'Woodgrove Bank Lisco', @NumeroCuenta = '1234567890', @DiasPago = 45, @Telefono = '(308) 555-0111',
    @Fax = '(308) 555-0112', @SitioWeb = 'http://www.proveedor.com', @DireccionEntrega1 = 'Suite 1',
    @CodigoPostalEntrega = '90410', @DireccionPostal1 = 'PO Box 1', @CodigoPostalPostal = '90410';

EXEC dbo.usp_Proveedores_Detalle @ProveedorID = @idProveedor;
EXEC dbo.usp_Proveedores_Eliminar @ProveedorID = @idProveedor;

-- Este falla a proposito: el proveedor 1 tiene productos y ordenes de compra
EXEC dbo.usp_Proveedores_Eliminar @ProveedorID = 1;
GO
