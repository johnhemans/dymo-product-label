<template>
    <b-modal
      ref="modal"
      id="product-modal"
      :title="modalLabel"
      @ok="handleSubmit"
      >
      <b-alert v-model="warningText.length" variant="danger" dismissible>
        {{warningText}}
      </b-alert>
      <form ref="form" @submit.stop.prevent="handleSubmit">
        <b-form-group
          id="name-group"
          label="Product Name:"
          label-for="name-input">
          <b-form-input
            id="name-input"
            v-model.trim="form.name"
            type="text"
            required
            placeholder="e.g. Ham"></b-form-input>
        </b-form-group>
        <b-form-group
          id="shelfLife-group"
          label="Shelf Life (hours):"
          label-for="shelfLife-input">
          <b-form-input
            id="shelfLife-input"
            v-model.trim="form.shelfLife"
            type="number"
            required
            placeholder="e.g. 48"></b-form-input>
        </b-form-group>
        <b-form-group
          id="defrost-group"
          label="Defrost (hours):"
          label-for="defrost-input">
          <b-form-input
            id="defrost-input"
            v-model.trim="form.defrost"
            type="number"
            required
            placeholder="e.g. 12"></b-form-input>
        </b-form-group>
      </form>
      <template v-slot:modal-footer="{ ok, cancel }">
        <b-button variant="danger" @click="hideModal">
          Cancel
        </b-button>
        <b-button variant="success" @click="handleSubmit">
          {{ successBtnLabel }}
        </b-button>
      </template>
    </b-modal>
</template>

<script>
export default {
  name: 'product-modal',
  props: {
    warningText: {
      type: String,
      default: ''
    },
    product: {
      type: Object,
      default: () => {}
    }
  },
  data () {
    return {
      form: {
        name: '',
        shelfLife: '',
        defrost: ''
      }
    }
  },
  computed: {
    modalLabel () {
      return this.modalData ? 'Edit Item' : 'Add Item'
    },
    successBtnLabel () {
      return this.modalData ? 'Save' : 'Create'
    }
  },
  watch: {
    product (data) {
      if (data) {
        this.form = { ...data.item }
      }
    }
  },
  created () {
    this.$root.$on('bv::modal::hide', (event, modalId) => {
      this.hideModal()
    })
  },
  methods: {
    handleSubmit () {
      this.$emit('onSubmit', { ...this.form })
      this.hideModal()
    },
    hideModal () {
      this.clearForm()
      this.$refs.modal.hide()
    },
    clearForm () {
      Object.keys(this.form).forEach(key => {
        this.form[key] = ''
      })
    }
  }
}
</script>