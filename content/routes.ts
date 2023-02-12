export default [
  {
    path: "/",
    component: (): Promise<typeof import("../pages/post/index.vue")> =>
      import("../pages/post/index.vue"),
  },
  // 他のルート
];

