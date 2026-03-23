import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, serviceRoleKey)

async function main() {
  try {
    // Count bills
    const { count: billCount, error: billError } = await supabase
      .from('bills')
      .select('id', { count: 'exact', head: true })
    
    console.log('Bills count:', billCount ?? 'Error: ' + billError?.message)

    // Count voting records
    const { count: voteCount, error: voteError } = await supabase
      .from('voting_records')
      .select('id', { count: 'exact', head: true })
    
    console.log('Voting records count:', voteCount ?? 'Error: ' + voteError?.message)

    // Get one sample bill
    const { data: sampleBill, error: billStructureError } = await supabase
      .from('bills')
      .select('*')
      .limit(1)
      .single()
    
    if (sampleBill) {
      console.log('\nSample bill:')
      console.log(JSON.stringify(sampleBill, null, 2))
    } else if (billStructureError) {
      console.log('No bills or error:', billStructureError.message)
    }

    // Get one sample voting record
    const { data: sampleVote, error: voteStructureError } = await supabase
      .from('voting_records')
      .select('*')
      .limit(1)
      .single()
    
    if (sampleVote) {
      console.log('\nSample voting record:')
      console.log(JSON.stringify(sampleVote, null, 2))
    } else if (voteStructureError) {
      console.log('No voting records or error:', voteStructureError.message)
    }

  } catch (err) {
    console.error('Error:', err.message)
  }
}

main()
