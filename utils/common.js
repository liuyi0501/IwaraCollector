let util = {}
util.getReturnData = (code,message = '',data = []) => {
        if( !data){
                data = []
        }
        return {code:code,message:message,data:data}
}
module.exports = util