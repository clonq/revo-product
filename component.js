module.exports = function(){
    var _ = require('underscore');
    var schemaValidator = require('jsonschema');
    var productSchema = require('bonsens-models').product;
    var dao = require('daoi');

    this.init = function(config) {
        var self = this;
        var daoImpl = dao.use(dao.FILE);
        dao.register('product');
        this.params = _.defaults(config||{}, defaults);
        process.on('product:create', function(pin){
            if(!!pin.verbose) console.log('clonq/revo-product: product:create: ', pin);
            var pout = {};
            var errors = validate(pin);
            if(errors.length == 0) {
                daoImpl
                .product
                .create(pin)
                .then(function(product){
                    process.emit('product:create.response', { product: product });
                })
                .catch(function(err){
                    pout.error = { message: err.message };
                    process.emit('product:create.response', pout);
                })
            } else {
                pout.error = { message: errors[0].message };
                process.emit('product:create.response', pout);
            }
        });        
        process.on('product:find', function(criteria){
            daoImpl.product.findOne(criteria)
            .then(function(product){
                process.emit(eventOut, product);
            })
            .catch(function(err){
                process.emit('product:find.error', err);
            })
        });
    }

    function validate(payload) {
        productSchema.required = ['name', 'SKU'];
        var schemaErrors = schemaValidator.validate(payload, productSchema).errors;
        if(schemaErrors.length > 0) return schemaErrors;
        var dataErrors = [];
        if(payload.name.length == 0) dataErrors.push({message:'name is mandatory'});
        if(payload.SKU.length == 0) dataErrors.push({message:'SKU is mandatory'});
        return dataErrors;
    }

}

var defaults = module.exports.defaults = {
    models: {
        product: {
            supportedMethods: ['find']
        }
    }
}