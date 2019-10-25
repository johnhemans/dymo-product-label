<template>
  <div id="landing-page">
    <b-navbar toggleable="lg" type="light" variant="light">
      <b-navbar-brand>Printer App</b-navbar-brand>
      <b-navbar-nav class="ml-auto">
        <b-button v-b-modal.product-modal variant="primary">Add Product</b-button>
      </b-navbar-nav>
    </b-navbar>

    <product-modal
      :product="selectedProduct"
      @onSubmit="handleSubmit">
    </product-modal>

    <print-modal
      :product="selectedProduct">
    </print-modal>

    <b-input-group>
      <b-form-input
        v-model="search"
        placeholder="Search Products..."
        ></b-form-input>
    </b-input-group>

    <b-table striped hover :fields="fields" :items="filteredItems">
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
          'shelfLife',
          { key: 'defrost', label: 'Defrost Time' },
          { key: 'actions', label: '' }
        ],
        search: '',
        selectedProduct: null,
        dymo: null
      }
    },
    computed: {
      filteredItems () {
        return this.items
          .filter(x => x.name.toLowerCase().includes(this.search.toLowerCase()))
          .map(x => {
            return { name: x.name, shelfLife: x.shelfLife + ' hours', defrost: x.defrost + ' hours' }
          })
      }
    },
    mounted () {
      this.getData()
    },
    beforeDestory () {
      storage.set('data', this.items)
    },
    methods: {
      printLabel (item) {
        this.selectedProduct = { item: this.items[item.index], index: item.index }
        this.$root.$emit('bv::show::modal', 'print-modal', '#printBtn')
      },
      handleSubmit (data) {
        if (this.selectedProduct) {
          this.items[this.selectedProduct.index] = data
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
          let items = JSON.parse(data)
          if (!items) {
            items = data
          }
          this.items = items
        })
      },
      saveData () {
        storage.set('data', this.items)
        this.getData()
      },
      removeItem (item) {
        this.items.splice(item.index, 1)
      },
      editItem (item) {
        this.selectedProduct = { item: this.items[item.index], index: item.index }
        this.$root.$emit('bv::show::modal', 'product-modal', '#editBtn')
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
