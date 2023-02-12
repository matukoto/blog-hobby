<template>
  <div>
    <h2>記事一覧</h2>
    <AllPost />
  </div>
</template>

<script lang="ts" setup>
import { useHead } from "#imports";

useHead({
  title: "post",
  meta: [
    { name: "description", content: "hobby" },
    { property: "og.title", content: "一覧" },
    { property: "og.type", content: "blog" },
  ],
});
</script>
