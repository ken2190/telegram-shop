const _ = require("lodash")
const Database = require("../../db/actions")
const Template = require("../template")


module.exports = {
    addProductToCart: async function (ctx, productName) {
        var cart = null
        var existingOrder = null        // Checks if user has a pending order that's incompleted

        const product = await Database.getProductByName(ctx.botInfo.id, productName)

        try {
            existingOrder = await Database.getPendingOrderByUser(ctx.botInfo.id, ctx.from.id)
            cart = await Database.getCartByProductOrder(existingOrder.toJSON().id, product.toJSON().id)
        } catch (error) { }

        if (cart) {         // Checks if user has existing cart
            cart.increment("quantity", { by: 1 })
        } else {        // Updates existing order if exist, else create new order
            if (existingOrder) {
                await Database.createCart(existingOrder.toJSON().id, product.toJSON().id, 1)
            } else {
                const newOrder = await Database.createOrder(ctx.from.id, ctx.botInfo.id)
                await Database.createCart(newOrder.toJSON().id, product.toJSON().id, 1)
            }
        }
    },
    removeProductFromCart: async function (ctx, productName) {
        const product = await Database.getProductByName(ctx.botInfo.id, productName)
        const existingOrder = await Database.getPendingOrderByUser(ctx.botInfo.id, ctx.from.id)
        const cart = await Database.getCartByProductOrder(existingOrder.toJSON().id, product.toJSON().id)
        await cart.decrement("quantity", { by: 1 })
    },
    sendCartMessage: async function (ctx, data) {
        await ctx.replyWithHTML(Template.indivCartMessage(data))
        // TODO - ADD INLINE KEYBOARD
    }
}