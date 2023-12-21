<template>
    <div class="search-bar">
      <div class="input-group mb-5">
        <input id="inputSearch" class="form-control" @input="search" placeholder="Codigo do Item" aria-label=""
          aria-describedby="button-addon2" />
      </div>
    </div>
</template>

<script setup lang="ts">
//@ts-nocheck
const emit = defineEmits(['search'])

const search = (e) => {
  emit('search', e.target.value)
}
</script>

<style scoped>

</style>