import Vue from 'vue'

import { library } from '@fortawesome/fontawesome-svg-core'

import { faPrint, faTrash } from '@fortawesome/free-solid-svg-icons'

import { faFrown, faEdit } from '@fortawesome/free-regular-svg-icons'

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

library.add(
  faFrown,
  faEdit,
  faPrint,
  faTrash
)

Vue.component('font-awesome-icon', FontAwesomeIcon)
