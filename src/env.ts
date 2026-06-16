import { defineEnvVars } from '@sveltejs/kit/hooks';

export const variables = defineEnvVars({
	GREEN_DISTRIBUTION_ID: {
		public: true
	},
	BLUE_DISTRIBUTION_ID: {
		public: true
	},
    OAC_ID: {
        public: true
    }
});