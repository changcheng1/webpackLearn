const main = function(resolve, reject) {
    import ('../page/index.vue').then(module => {
        resolve(module)
     })
}
export default [{
    path: '/main',
    component: main
}]