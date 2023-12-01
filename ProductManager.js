const { promises } = require("dns")
const fs = require("fs")
const { json } = require("stream/consumers")

class ProductManager {
    constructor(){
        this.products = []
        this.path = "Products.json"
    }
    async addProduct(title, description, price, thumbnail, code, stock){
        title = title || undefined
        description = description || undefined
        price = price ?? undefined
        thumbnail = thumbnail ?? undefined
        code = code || undefined
        stock = stock ?? undefined
        let id = 0
        const statsJson = await fs.promises.stat(this.path)
        let validoCode = []
        // Aca verifico si hay o no productos cargados en el Products.json para no repetir productos con el mismo codigo
        if (statsJson.size === 0){
            validoCode = this.products.find((codeSearch) => codeSearch.code == code)
        } else {
            const buscaCode = await fs.promises.readFile(this.path, "utf-8")
            const buscaCodeParse = JSON.parse(buscaCode)
            validoCode = buscaCodeParse.find((codeSearch) => codeSearch.code == code)
        }
        if ( title == undefined || thumbnail == undefined|| price == undefined || description == undefined || code == undefined || stock  == undefined ){
            return console.log("Es necesario que todos los campos esten completos.")
        }else if (validoCode== undefined){
            let size = 0
            // le asigno el valor a products lo que hay en el archivo, asi se escriben todos los archivos y no me borre los anteriores
            if (statsJson.size !== 0){
                const leoArchivo = await fs.promises.readFile(this.path, "utf-8")
                const leoArchivoParse = JSON.parse(leoArchivo)
                this.products = leoArchivoParse
                size = leoArchivoParse.length
            }else {
                size = this.products.length
            }
            for (let i = 0; i < size; i++){
                const element = this.products[i]
                if (element.id > id){
                    id = element.id
                }
            }
            id++
            this.products.push({title, description, price, thumbnail, code,stock, id: id})
            const productosString = JSON.stringify(this.products, null , 2)
            await fs.promises.writeFile(this.path, productosString)
        }else{
            return console.log("Codigo de producto ya ingresado.")
        }
    }
    async getProducts(){
        // siempre verifico que exista algo en el archivo
        const statsJsonProduct = await fs.promises.stat(this.path)
        if (statsJsonProduct.size === 0){
            return console.log("No hay productos ingresados");
        }else{
            const ProductosArchivo = await fs.promises.readFile(this.path, "utf-8")
            const ProductosParse = JSON.parse(ProductosArchivo)
            return console.log(ProductosParse);
        }
    }
    async getProductById(id){
        // siempre verifico que exista algo en el archivo
        const statsJsonId = await fs.promises.stat(this.path)
        if (statsJsonId.size === 0){
            return console.log("No hay productos ingresados.");
        }else {
            // busco el id consiguiendo el array que esta almacenado en json 
            const buscaId = await fs.promises.readFile(this.path, "utf-8")
            const buscaIdParse = JSON.parse(buscaId)
            const productoEncontrado = buscaIdParse.find((item) => (item.id == id))
            if (productoEncontrado){
                return console.log(productoEncontrado)
            }else {
                return console.log("NOT FOUND")
            }
        }
    }
    async deleteProducts(id){
        // siempre verifico que exista algo en el archivo
        const statJsonDelete = await fs.promises.stat(this.path)
        if (statJsonDelete.size === 0){
            return console.log("No hay productos cargados.");
        }else {
            // busco el id del producto a eliminar, lo elimino del array y sobreescribo el producs.json sin el producto eliminado
            const deleteRead = await fs.promises.readFile(this.path, "utf-8")
            const deleteProducts = JSON.parse(deleteRead)
            const index = deleteProducts.findIndex((item) => item.id === id)
            if (index !== -1){
                // splice para eliminar el objeto del array con su indice
                deleteProducts.splice(index, 1)
                const deleteContent = JSON.stringify(deleteProducts, null, 2)
                await fs.promises.writeFile(this.path, deleteContent)
                console.log(`Producto de id: ${id} eliminado correctamente`);
            }else {
                return console.log(`ID ${id} no encontrado`);
            }
        }
    }
    async updateProducts(id, CamposUpdate){
        // siempre verifico que exista algo en el archivo
        const statJsonUpdate = await fs.promises.stat(this.path)
        if (statJsonUpdate.size === 0){
            return console.log("No hay productos cargados");
        }else{
            // busco el objeto con su id, consiguiendo el array del archivo.
            let updateContentRead = await fs.promises.readFile(this.path, "utf-8")
            const updateContent = JSON.parse(updateContentRead)
            const indexUpdate = updateContent.findIndex((item) => item.id === id)
            if (indexUpdate !== -1){
                // el object.assign lo utilizo para seleccionar solamente los campos especificados
                Object.assign(updateContent[indexUpdate], CamposUpdate)
                const updateString = JSON.stringify(updateContent, null, 2)
                await fs.promises.writeFile(this.path, updateString)
            }else {
                return console.log("Producto no encontrado.");
            }
        }
    }
}


async function cosasAsincronas(){
    const producto = new ProductManager()
    await producto.getProducts() // si esta vacio, no hay productos ingresados
    await producto.addProduct("hola") // todos los campos deben estar completos
    await producto.addProduct("hola", "yo", 10, "nada", "abc123", 120) // lo carga si no estaba cargado, en caso contrario da codigo de producto ya ingresado
    await producto.addProduct("holasda", "y123o", 10, "na123da", "abc123", 120) // siempre dara codigo de producto ya ingresado
    await producto.addProduct("otro", "nose", 13, "ajam", "alojamama", 10) // lo carga si no esba cargado, en caso contrario da codigo de producto ya ingresado
    await producto.getProductById(11) // NOT FOUND
    await producto.getProductById(1) // producto con id 1
    await producto.deleteProducts(2) // eliminar el producto con id 2, si no se encuentra el id ID 2 no encontrado
    await producto.updateProducts(1, {price: 30}) // modifica el precio del producto con id 1
    await producto.getProductById(1) // muestra el producto con id 1 modificado
}
cosasAsincronas()

