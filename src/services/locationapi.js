import { customerApiGet } from './api'

export async function getCountries() {
  return customerApiGet('/api/Location/countries')
}

export async function getStates() {
  return customerApiGet('/api/Location/states')
}
