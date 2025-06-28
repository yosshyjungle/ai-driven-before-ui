import { createClient } from '@supabase/supabase-js'

// Supabaseの設定（環境変数のエラーハンドリングを追加）
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// 環境変数の確認
if (!supabaseUrl || !supabaseAnonKey) {
    console.error('🚨 Supabase環境変数が設定されていません')
    console.error('必要な環境変数:')
    console.error('- NEXT_PUBLIC_SUPABASE_URL')
    console.error('- NEXT_PUBLIC_SUPABASE_ANON_KEY')
    console.error('詳細はREADMEファイルを確認してください')
}

// デバッグ用ログ
console.log('Supabase URL:', supabaseUrl ? 'Set' : 'Not set')
console.log('Supabase Anon Key:', supabaseAnonKey ? 'Set' : 'Not set')

// Supabaseクライアントの作成（環境変数が未設定でもエラーを回避）
export const supabase = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder-key'
)

// 環境変数チェック関数
const checkEnvironmentVariables = (): boolean => {
    if (!supabaseUrl || !supabaseAnonKey) {
        console.error('🚨 Supabase環境変数が設定されていません')
        return false
    }
    return true
}

// バケットの存在確認
const checkBucketExists = async (bucketName: string): Promise<boolean> => {
    try {
        // バケット一覧を取得
        const { data: buckets, error: listError } = await supabase.storage.listBuckets()

        if (listError) {
            console.error('バケット一覧取得エラー:', listError)
            console.log('利用可能なバケットを確認できません。デフォルトバケットを試します。')
            return true // エラーでも処理を続行
        }

        console.log('利用可能なバケット:', buckets?.map(b => b.name))

        // バケットが存在するかチェック
        const bucketExists = buckets?.some(bucket => bucket.name === bucketName)

        if (bucketExists) {
            console.log(`バケット '${bucketName}' は存在します`)
            return true
        } else {
            console.log(`バケット '${bucketName}' は存在しません`)
            // 他の一般的なバケット名を提案
            const commonBuckets = ['images', 'uploads', 'public', 'storage']
            const availableCommonBucket = buckets?.find(bucket =>
                commonBuckets.includes(bucket.name)
            )

            if (availableCommonBucket) {
                console.log(`代替バケット '${availableCommonBucket.name}' が利用可能です`)
            }

            return false
        }
    } catch (error) {
        console.error('バケット確認エラー:', error)
        return true // エラーでも処理を続行
    }
}

// 画像アップロード関数（環境変数チェックと匿名アクセス対応）
export const uploadImage = async (file: File, primaryBucket: string = 'images'): Promise<string | null> => {
    try {
        // 環境変数チェック
        if (!checkEnvironmentVariables()) {
            console.error('❌ 環境変数が設定されていないため、アップロードを中止します')
            return null
        }

        console.log('画像アップロード開始:', { fileName: file.name, fileSize: file.size, bucket: primaryBucket })

        // ファイル名を一意にするためにタイムスタンプを追加
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`

        console.log('生成されたファイル名:', fileName)

        // 指定されたバケットに直接アップロード（匿名アクセス）
        console.log(`バケット '${primaryBucket}' でアップロードを試行中...`)

        const { data, error } = await supabase.storage
            .from(primaryBucket)
            .upload(fileName, file, {
                cacheControl: '3600',
                upsert: false
            })

        if (!error && data) {
            console.log(`バケット '${primaryBucket}' でアップロード成功:`, data)

            // 公開URLを取得
            const { data: publicUrl } = supabase.storage
                .from(primaryBucket)
                .getPublicUrl(fileName)

            console.log('公開URL生成:', publicUrl.publicUrl)
            return publicUrl.publicUrl
        } else if (error) {
            // より詳細なエラー情報を表示
            console.error(`バケット '${primaryBucket}' でエラー詳細:`, {
                message: error.message || 'メッセージなし',
                error: error,
                errorType: typeof error,
                errorKeys: Object.keys(error),
                errorString: JSON.stringify(error),
                name: error.name || 'エラー名なし'
            })

            // エラーの詳細分析
            const errorMessage = error.message || ''

            if (errorMessage.includes('row-level security') || errorMessage.includes('RLS')) {
                console.log('🔒 Row Level Security (RLS) エラーが発生しました')
                console.log('対処法:')
                console.log('1. Supabase管理画面 → Storage → images バケット → Policies')
                console.log('2. 以下のポリシーが設定されているか確認:')
                console.log('   - INSERT: 匿名ユーザーがアップロード可能')
                console.log('   - SELECT: 匿名ユーザーが読み取り可能')
                console.log('3. または以下のSQLを実行:')
                console.log(`
-- 匿名ユーザーによるアップロードを許可
CREATE POLICY "Allow anonymous uploads" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'images');

-- 匿名ユーザーによる読み取りを許可
CREATE POLICY "Allow anonymous read access" ON storage.objects  
FOR SELECT USING (bucket_id = 'images');
                `)
            } else if (errorMessage.includes('bucket') && errorMessage.includes('not found')) {
                console.log('🪣 バケットが見つかりません')
                console.log(`バケット名 '${primaryBucket}' が正しく作成されているか確認してください`)
                console.log('Supabase管理画面 → Storage → Bucketsで確認してください')
            } else if (errorMessage.includes('file size') || errorMessage.includes('too large')) {
                console.log('📁 ファイルサイズが大きすぎます')
                console.log(`ファイルサイズ: ${(file.size / 1024 / 1024).toFixed(2)}MB`)
            } else if (errorMessage.includes('permission') || errorMessage.includes('unauthorized')) {
                console.log('🚫 権限エラー')
                console.log('Storageのポリシー設定を確認してください')
                console.log('匿名ユーザーによるアップロードが許可されているか確認してください')
            } else if (!errorMessage) {
                console.log('❓ エラーメッセージが空です')
                console.log('これは通常、権限エラーまたはネットワークエラーを示します')
                console.log('1. インターネット接続を確認')
                console.log('2. Supabaseプロジェクトが有効か確認')
                console.log('3. 環境変数が正しく設定されているか確認')
                console.log('4. Storageのポリシー設定を確認')
            }

            return null
        }

        return null

    } catch (error) {
        console.error('予期しないエラー:', {
            error: error,
            message: error instanceof Error ? error.message : 'unknown',
            stack: error instanceof Error ? error.stack : 'no stack'
        })
        return null
    }
}

// 画像削除関数
export const deleteImage = async (imageUrl: string): Promise<boolean> => {
    try {
        // 環境変数チェック
        if (!checkEnvironmentVariables()) {
            console.error('❌ 環境変数が設定されていないため、削除を中止します')
            return false
        }

        // URLからバケット名とファイル名を抽出
        const urlParts = imageUrl.split('/')
        const fileName = urlParts.pop()

        if (!fileName) return false

        // URLからバケット名を推測
        const storageIndex = urlParts.findIndex(part => part === 'storage')
        const bucketName = storageIndex !== -1 ? urlParts[storageIndex + 2] : 'images'

        console.log('画像削除試行:', { fileName, bucketName })

        const { error } = await supabase.storage
            .from(bucketName)
            .remove([fileName])

        if (error) {
            console.error('画像削除エラー:', error)
            return false
        }

        console.log('画像削除成功')
        return true
    } catch (error) {
        console.error('予期しないエラー:', error)
        return false
    }
} 