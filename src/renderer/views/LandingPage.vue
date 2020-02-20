<template>
  <div id="landing-page">
    <b-navbar toggleable="lg" type="light" variant="light">
      <b-navbar-brand>Printer App</b-navbar-brand>
      <b-navbar-nav class="ml-auto">
        <b-button @click="showModal('productModal')" variant="danger">Add Product</b-button>
      </b-navbar-nav>
    </b-navbar>

    <product-modal
      v-if="showProductModal"
      :product="selectedProduct"
      @onSubmit="handleSubmit">
    </product-modal>

    <print-modal
      v-if="showPrintModal"
      :product="selectedProduct">
    </print-modal>

    <b-input-group>
      <b-form-input
        v-model="search"
        placeholder="Search Products..."
        ></b-form-input>
    </b-input-group>

    <b-table striped hover :fields="fields" :items="filteredItems">
      <template v-slot:cell(defrost)="data">
        {{ getDuration(data.value) }}
      </template>
      <template v-slot:cell(shelfLife)="data">
        {{ getDuration(data.value) }}
      </template>
      <template v-slot:cell(actions)="data">
        <div class="d-flex justify-content-end">
          <span ref="printBtn" title="Print Label" @click="() => printLabel(data)" class="action-btn"><font-awesome-icon :icon="['fas', 'print']"></font-awesome-icon></span>
          <span ref="editBtn" title="Edit Item" @click="() => editItem(data)" class="action-btn"><font-awesome-icon :icon="['far', 'edit']"></font-awesome-icon></span>
          <span title="Delete Item" @click="() => removeItem(data)" class="action-btn"><font-awesome-icon :icon="['fas', 'trash']"></font-awesome-icon></span>
        </div>
      </template>
    </b-table>

    <div v-if="!filteredItems.length && items.length && search" class="text-center">
      <h3>No Results <font-awesome-icon :icon="['far', 'frown']"></font-awesome-icon></h3>
      <b-button @click="clearSearch" variant="danger">Clear Search</b-button>
    </div>

  </div>
</template>

<script>
  import moment from 'moment'
  import storage from 'electron-json-storage'
  import ProductModal from '@/components/ProductModal.vue'
  import PrintModal from '@/components/PrintModal.vue'

  export default {
    name: 'landing-page',
    components: {
      ProductModal,
      PrintModal
    },
    data () {
      return {
        items: [],
        fields: [
          'name',
          { key: 'defrost', label: 'Defrost Time' },
          'shelfLife',
          { key: 'actions', label: '' }
        ],
        search: '',
        selectedProduct: null,
        dymo: null,
        showProductModal: false,
        showPrintModal: false
      }
    },
    computed: {
      filteredItems () {
        return this.items
          .filter(x => x && x.name.toLowerCase().includes(this.search.toLowerCase()))
          .map(x => {
            return { id: this.items.indexOf(x), name: x.name, shelfLife: x.shelfLife, defrost: x.defrost }
          })
      }
    },
    created () {
      this.$root.$on('bv::modal::hide', (event, modalId) => this.hideModal(modalId))
      this.$root.$on('bv::modal::show', (event, modalId) => this.showModal(modalId))
    },
    mounted () {
      this.getData()
    },
    beforeDestory () {
      storage.set('data', this.items)
    },
    methods: {
      hideModal (modalId) {
        if (modalId === 'productModal') {
          this.showProductModal = false
        } else {
          this.showPrintModal = false
        }
      },
      showModal (modalId) {
        if (modalId === 'productModal') {
          this.showProductModal = true
        } else {
          this.showPrintModal = true
        }
      },
      getDuration (val) {
        let result = ''
        const days = Math.floor(moment.duration(Number(val), 'hours').asDays())
        if (days > 0) result += `${days} ${days === 1 ? 'day' : 'days'} `
        const hours = moment.duration(Number(val), 'hours').subtract(days, 'd').asHours()
        if (hours > 0) result += `${hours} ${hours === 1 ? 'hour' : 'hours'}`
        return result
      },
      printLabel (item) {
        this.selectedProduct = JSON.parse(JSON.stringify(item.item))
        this.showPrintModal = true
      },
      handleSubmit (data) {
        if (this.selectedProduct) {
          this.items.splice(this.selectedProduct.id, 1, data)
        } else {
          this.items.push(data)
        }
        this.selectedProduct = null
        this.saveData()
      },
      clearSearch () {
        this.search = ''
      },
      getData () {
        storage.get('data.json', (err, data) => {
          if (err) throw err
          if (data && Array.isArray(data)) {
            this.items = data
          }
        })
      },
      saveData () {
        storage.set('data', this.items, (err) => {
          if (err) throw err
          this.getData()
        })
      },
      removeItem (item) {
        this.items = this.items.filter((x, index) => item.item.id !== index)
        this.saveData()
      },
      editItem (item) {
        this.selectedProduct = JSON.parse(JSON.stringify(item.item))
        this.showProductModal = true
      }
    }
  }
</script>

<style lang="scss" scoped>
  .action-btn {
    cursor: pointer;
    margin-right: 1.5rem;
  }
</style>
