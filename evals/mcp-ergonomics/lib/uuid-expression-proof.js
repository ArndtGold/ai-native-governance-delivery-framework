// Static proof of numeric data primitives and a self-contained UUID idiom, not
// permission for arbitrary Math access or calls. Never evaluates code. Wrapper checks
// (tool allowlist, forbidden properties/globals, no imports/eval) still apply.
const id=(node,name)=>node?.type==='Identifier'&&node.name===name;
const literal=(node,value)=>node?.type==='Literal'&&node.value===value;
const member=(node,owner,name)=>node?.type==='MemberExpression'&&!node.computed&&id(node.object,owner)&&id(node.property,name);
const binary=(node,operator,left,right)=>node?.type==='BinaryExpression'&&node.operator===operator&&left(node.left)&&right(node.right);
const call=(node,owner,name,args)=>node?.type==='CallExpression'&&member(node.callee,owner,name)&&node.arguments.length===args.length&&args.every((check,i)=>check(node.arguments[i]));
// These primitives return numbers without coercing objects or calling user
// methods. This also proves indexed-hex UUID builders, without enumerating every
// harmless spelling of the complete UUID expression.
export function pureMathCall(node) {
  return call(node,'Math','random',[]) || call(node,'Math','floor',[pureNumericExpression]);
}
export function pureNumericExpression(node) {
  if(node?.type==='Literal')return typeof node.value==='number'&&Number.isFinite(node.value);
  if(node?.type==='UnaryExpression')return ['+','-','~'].includes(node.operator)&&pureNumericExpression(node.argument);
  if(node?.type==='BinaryExpression')return ['+','-','*','/','%','**','&','|','^','<<','>>','>>>'].includes(node.operator)
    &&pureNumericExpression(node.left)&&pureNumericExpression(node.right);
  return pureMathCall(node);
}
export function numericHexCall(node) {
  return node?.type==='CallExpression'&&node.callee?.type==='MemberExpression'&&!node.callee.computed
    &&id(node.callee.property,'toString')&&node.arguments.length===1&&literal(node.arguments[0],16)&&pureNumericExpression(node.callee.object);
}
function uuid(node) {
  if(node.type!=='CallExpression'||node.arguments.length!==2||node.callee?.type!=='MemberExpression'||node.callee.computed
    ||!id(node.callee.property,'replace')||!literal(node.callee.object,'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx')
    ||node.arguments[0].regex?.pattern!=='[xy]'||node.arguments[0].regex.flags!=='g')return false;
  const fn=node.arguments[1];
  if(fn.type!=='ArrowFunctionExpression'||fn.async||fn.params.length!==1||fn.params[0].type!=='Identifier'
    ||fn.body.type!=='BlockStatement'||fn.body.body.length!==2)return false;
  const [declaration,returned]=fn.body.body, c=fn.params[0].name;
  if(declaration.type!=='VariableDeclaration'||declaration.kind!=='const'||declaration.declarations.length!==1
    ||declaration.declarations[0].id.type!=='Identifier'||returned.type!=='ReturnStatement')return false;
  const variable=declaration.declarations[0],r=variable.id.name;
  const random=n=>call(n,'Math','random',[]);
  const product=n=>binary(n,'*',random,n=>literal(n,16));
  if(!binary(variable.init,'|',product,n=>literal(n,0))&&!call(variable.init,'Math','floor',[product]))return false;
  const value=returned.argument;
  if(value?.type!=='CallExpression'||value.arguments.length!==1||!literal(value.arguments[0],16)
    ||value.callee.type!=='MemberExpression'||value.callee.computed||!id(value.callee.property,'toString'))return false;
  const choice=value.callee.object;
  return choice.type==='ConditionalExpression'&&binary(choice.test,'===',n=>id(n,c),n=>literal(n,'x'))&&id(choice.consequent,r)
    &&binary(choice.alternate,'|',n=>binary(n,'&',n=>id(n,r),n=>literal(n,3)),n=>literal(n,8));
}
const visit=(node,consume)=>{
  if(!node||typeof node!=='object'||!node.type)return;
  consume(node);
  for(const value of Object.values(node))if(Array.isArray(value))for(const child of value)visit(child,consume);else visit(value,consume);
};
export function uuidExpressionNodes(tree) {
  const proved=new Set();
  visit(tree,node=>{if(uuid(node))visit(node,child=>proved.add(child));});
  return proved;
}
