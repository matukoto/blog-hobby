<template>
  <div>
    <ContentDoc v-slot="{ doc: page }">
      <h1>{{ page.title }}</h1>
      <ContentRenderer :key="page._id" :value="page"></ContentRenderer>
    </ContentDoc>
  </div>
</template>
