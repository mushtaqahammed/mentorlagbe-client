/** Public, non-sensitive profile fields returned by /api/profile. */
export type ProfileUser = {
  id: string
  name: string
  email: string
  image: string | null
  phone: string
  role: string
  createdAt: string | null
}
