var should = require('chai').should();

var Product = require('./component');
var product = new Product();
product.init();

describe('smoke tests', function(){
    it('should not create a product without a name', function(done){
        process.once('product:create.response', function(result){
            should.exist(result);
            result.should.have.property('error');
            result.error.should.have.property('message');
            result.error.message.should.equal('requires property "name"');
            done();
        });
        process.emit('product:create', {});
    });
    it('should not create a product without a SKU', function(done){
        process.once('product:create.response', function(result){
            should.exist(result);
            result.should.have.property('error');
            result.error.should.have.property('message');
            result.error.message.should.equal('requires property "SKU"');
            done();
        });
        process.emit('product:create', {name:'test'});
    });
    it('should create valid products', function(done){
        process.once('product:create.response', function(result){
            console.log(result)
            should.exist(result);
            result.should.not.have.property('error');
            result.should.have.property('product');
            result.product.should.have.property('name');
            result.product.name.should.equal('test');
            done();
        });
        process.emit('product:create', {name:'test', SKU:'1'});
    });
});
