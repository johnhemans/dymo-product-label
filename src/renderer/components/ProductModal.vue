<template>
    <b-modal
      id="productModal"
      ref="modal"
      :visible="true"
      :title="modalLabel"
      @ok="handleSubmit"
      >
      <b-alert v-model="warningText.length" variant="danger" dismissible>
        {{warningText}}
      </b-alert>
      <form ref="form" @submit.stop.prevent="handleSubmit">
        <b-form-group
          id="name-group"
          label="Product Name"
          label-for="name-input">
          <b-form-input
            id="name-input"
            v-model.trim="form.name"
            type="text"
            required
            placeholder="e.g. Ham"></b-form-input>
        </b-form-group>
        <b-form-group
          id="defrost-group"
          label="Defrost"
          label-for="defrost-input">
          <b-row>
            <b-col>
              <b-form-input
                id="defrost-input"
                v-model.trim="form.defrost"
                type="number"
                required
                placeholder="e.g. 12" />
            </b-col>
            <b-col cols="4">
              <b-form-select
                v-model="defrostType"
                :options="timeOptions"
                @change="onDefrostTypeChange" />
            </b-col>
          </b-row>
        </b-form-group>
        <b-form-group
          id="shelfLife-group"
          label="Shelf Life"
          label-for="shelfLife-input">
          <b-row>
            <b-col>
              <b-form-input
                id="shelfLife-input"
                v-model.trim="form.shelfLife"
                type="number"
                required
                placeholder="e.g. 48"></b-form-input>
            </b-col>
            <b-col cols="4">
              <b-form-select
                v-model="shelfLifeType"
                :options="timeOptions"
                @change="onShelfLifeTypeChange"
              />
            </b-col>
          </b-row>
        </b-form-group>
      </form>
      <template v-slot:modal-footer="{ cancel }">
        <b-button variant="danger" @click="cancel()">
          Cancel
        </b-button>
        <b-button variant="success" @click="handleSubmit">
          {{ successBtnLabel }}
        </b-button>
      </template>
    </b-modal>
</template>

<script>
import moment from 'moment'

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
      },
      shelfLifeType: 'Hours',
      defrostType: 'Hours',
      timeOptions: [
        'Hours',
        'Days'
      ]
    }
  },
  computed: {
    modalLabel () {
      return this.product ? 'Edit Item' : 'Add Item'
    },
    successBtnLabel () {
      return this.product ? 'Save' : 'Create'
    }
  },
  mounted () {
    if (this.product) {
      this.form = JSON.parse(JSON.stringify(this.product))
    }
  },
  methods: {
    handleSubmit () {
      if (this.shelfLifeType === 'Days') {
        this.form.shelfLife = moment.duration(Number(this.form.shelfLife), 'days').asHours()
      }
      if (this.defrostType === 'Days') {
        this.form.defrost = moment.duration(Number(this.form.defrost), 'days').asHours()
      }
      this.$emit('onSubmit', JSON.parse(JSON.stringify(this.form)))
      this.$refs.modal.hide()
    },
    onShelfLifeTypeChange (type) {
      if (type === 'Days') {
        this.form.shelfLife = moment.duration(Number(this.form.shelfLife), 'hours').asDays()
      } else {
        this.form.shelfLife = moment.duration(Number(this.form.shelfLife), 'days').asHours()
      }
    },
    onDefrostTypeChange (type) {
      if (type === 'Days') {
        this.form.defrost = moment.duration(Number(this.form.defrost), 'hours').asDays()
      } else {
        this.form.defrost = moment.duration(Number(this.form.defrost), 'days').asHours()
      }
    }
  }
}
</script>