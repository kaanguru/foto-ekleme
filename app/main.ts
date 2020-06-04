import Vue from 'nativescript-vue'
import App from './components/App.vue'
import VueDevtools from 'nativescript-vue-devtools'
import VueApollo from 'vue-apollo'
import { ApolloClient } from 'apollo-client'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { createUploadLink } from "apollo-upload-client";


// Cache implementation
const cache = new InMemoryCache()


// Create the apollo client
const apolloClient = new ApolloClient({
  cache,
  link: createUploadLink({
    uri: "http://192.168.0.2:1515/graphql"
  })
})

Vue.use(VueApollo);

const apolloProvider = new VueApollo({
  defaultClient: apolloClient,
})


///////////////////////////////////
if(TNS_ENV !== 'production') {
  Vue.use(VueDevtools)
}


// Prints Vue logs when --env.production is *NOT* set while building
Vue.config.silent = (TNS_ENV === 'production')

Vue.registerElement(
  'RadSideDrawer',
  () => require('nativescript-ui-sidedrawer').RadSideDrawer
)

new Vue({
  apolloProvider,
  render: h => h('frame', [h(App)])
}).$start()
