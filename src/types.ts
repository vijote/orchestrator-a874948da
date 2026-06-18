export type Environment = {
    environment: string
    env_status: string
    alb_dns_name: string
    host_bucket_name: string
    recipes_bucket_name: string
}

export enum EnvironmentStates {
    PROCESSING = "processing",
    UNUSED = 'unused',
    BLUE = 'blue',
    GREEN = 'green'
}