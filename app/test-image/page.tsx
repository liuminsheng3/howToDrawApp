'use client'

import { useState } from 'react'
import Image from 'next/image'

export default function TestImagePage() {
  const [imageUrl, setImageUrl] = useState('')
  const [useNextImage, setUseNextImage] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const testUrls = [
    'https://replicate.delivery/pbxt/example.png',
    'https://obdnfxohhlsxcqrzhsad.supabase.co/storage/v1/object/public/tutorial-images/test.png',
    'https://via.placeholder.com/400x400/cccccc/666666?text=Test+Image'
  ]

  return (
    <main className="min-h-screen p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">图片显示测试</h1>
      
      <div className="mb-8">
        <label className="block mb-2 font-semibold">输入图片URL进行测试：</label>
        <input
          type="text"
          value={imageUrl}
          onChange={(e) => {
            setImageUrl(e.target.value)
            setError(null)
          }}
          placeholder="https://example.com/image.png"
          className="w-full p-2 border rounded mb-4"
        />
        
        <div className="flex gap-4 mb-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={useNextImage}
              onChange={(e) => setUseNextImage(e.target.checked)}
            />
            使用 Next.js Image 组件
          </label>
        </div>

        <div className="mb-4">
          <p className="font-semibold mb-2">快速测试URL：</p>
          <div className="flex flex-wrap gap-2">
            {testUrls.map((url) => (
              <button
                key={url}
                onClick={() => setImageUrl(url)}
                className="text-blue-500 underline text-sm"
              >
                {url.substring(0, 50)}...
              </button>
            ))}
          </div>
        </div>
      </div>

      {imageUrl && (
        <div className="space-y-4">
          <div className="border-2 border-gray-300 rounded p-4">
            <h2 className="font-bold mb-2">
              {useNextImage ? 'Next.js Image 组件' : '原生 img 标签'}
            </h2>
            
            {useNextImage ? (
              <div className="relative w-full aspect-square max-w-md mx-auto">
                <Image
                  src={imageUrl}
                  alt="Test image"
                  fill
                  className="object-contain"
                  onError={(e) => {
                    setError('Next.js Image 加载失败: ' + e.currentTarget.src)
                  }}
                  unoptimized
                />
              </div>
            ) : (
              <img
                src={imageUrl}
                alt="Test image"
                className="w-full max-w-md mx-auto"
                onError={(e) => {
                  setError('原生 img 加载失败: ' + e.currentTarget.src)
                }}
              />
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-300 rounded p-4">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          <div className="bg-gray-100 rounded p-4">
            <h3 className="font-bold mb-2">图片信息：</h3>
            <pre className="text-xs overflow-auto">
{JSON.stringify({
  url: imageUrl,
  domain: new URL(imageUrl).hostname,
  protocol: new URL(imageUrl).protocol,
  pathname: new URL(imageUrl).pathname
}, null, 2)}
            </pre>
          </div>
        </div>
      )}

      <div className="mt-8 p-4 bg-yellow-50 rounded">
        <h3 className="font-bold mb-2">常见问题：</h3>
        <ul className="text-sm space-y-1">
          <li>• Next.js Image组件需要在next.config.js中配置域名白名单</li>
          <li>• Flux模型可能使用不同的CDN域名</li>
          <li>• 检查浏览器控制台是否有CORS错误</li>
          <li>• 确认图片URL是否可以直接访问</li>
        </ul>
      </div>
    </main>
  )
}