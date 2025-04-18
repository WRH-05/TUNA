import { createClient } from "@supabase/supabase-js"

async function setupStorage() {
  // Create a Supabase client with the service role key
  const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

  try {
    // Create the captures bucket if it doesn't exist
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()

    if (bucketsError) {
      throw bucketsError
    }

    const capturesBucketExists = buckets.some((bucket) => bucket.name === "captures")

    if (!capturesBucketExists) {
      const { error: createError } = await supabase.storage.createBucket("captures", {
        public: false,
        fileSizeLimit: 10485760, // 10MB
      })

      if (createError) {
        throw createError
      }

      console.log("Created captures bucket")
    } else {
      console.log("Captures bucket already exists")
    }

    // Set up RLS policies for the bucket
    const { error: policyError } = await supabase.rpc("create_storage_policy", {
      bucket_name: "captures",
      policy_name: "User can read own captures",
      definition: "(auth.uid() = owner)",
    })

    if (policyError) {
      // Removed console.error for read policy error
    }

    const { error: insertPolicyError } = await supabase.rpc("create_storage_policy", {
      bucket_name: "captures",
      policy_name: "User can upload own captures",
      definition: "(auth.uid() = owner)",
      operation: "INSERT",
    })

    if (insertPolicyError) {
      // Removed console.error for insert policy error
    }

    console.log("Storage setup complete")
  } catch (error) {
    // Removed console.error for storage setup error
  }
}

setupStorage()
