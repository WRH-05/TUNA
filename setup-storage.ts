import { createClient } from "@supabase/supabase-js"
import dotenv from "dotenv"

// Load environment variables
dotenv.config()

async function setupStorage() {
  // Create a Supabase client with the service role key
  const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

  try {
    console.log("Setting up Supabase Storage for page captures...")

    // Check if the bucket already exists
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()

    if (bucketsError) {
      throw bucketsError
    }

    const capturesBucketExists = buckets.some((bucket) => bucket.name === "captures")

    // Create the bucket if it doesn't exist
    if (!capturesBucketExists) {
      console.log('Creating "captures" bucket...')
      const { error } = await supabase.storage.createBucket("captures", {
        public: false,
        fileSizeLimit: 10485760, // 10MB limit
      })

      if (error) {
        throw error
      }

      console.log('✅ "captures" bucket created successfully')
    } else {
      console.log('✅ "captures" bucket already exists')
    }

    // Create policies
    console.log("Setting up storage policies...")

    // SELECT policy
    console.log("Creating SELECT policy...")
    await supabase.storage.from("captures").createPolicy("Users can view their own captures", {
      name: "Users can view their own captures",
      definition: "auth.uid() = owner",
      operation: "SELECT",
    })

    // INSERT policy
    console.log("Creating INSERT policy...")
    await supabase.storage.from("captures").createPolicy("Users can upload their own captures", {
      name: "Users can upload their own captures",
      definition: "auth.uid() = owner",
      operation: "INSERT",
    })

    // UPDATE policy
    console.log("Creating UPDATE policy...")
    await supabase.storage.from("captures").createPolicy("Users can update their own captures", {
      name: "Users can update their own captures",
      definition: "auth.uid() = owner",
      operation: "UPDATE",
    })

    // DELETE policy
    console.log("Creating DELETE policy...")
    await supabase.storage.from("captures").createPolicy("Users can delete their own captures", {
      name: "Users can delete their own captures",
      definition: "auth.uid() = owner",
      operation: "DELETE",
    })

    console.log("✅ Storage policies created successfully")
    console.log("✅ Storage setup complete!")
  } catch (error) {
    console.error("❌ Error setting up storage:", error)
  }
}

setupStorage()
