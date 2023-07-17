
const CategoryButton = {
	props: ['category'],
	template: `
        <button class='category' v-bind:data-id="category.id" v-bind:data-parent='category.parent' v-if='category' v-on:click="onClick">
            <p>{{category.name}}</p>
        </button>`,
	methods: {
		onClick: function(){
			this.$root.onCategoryClick( this.category.id, this.category.parent_id, this.category.name );
		},
	},
};