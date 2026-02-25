import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export function UnauthorizedPage() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-svh items-center justify-center p-4">
      <Card className="w-full max-w-sm text-center">
        <CardHeader>
          <CardTitle>403 — Forbidden</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            You do not have permission to access this page.
          </p>
        </CardContent>
        <CardFooter className="justify-center">
          <Button variant="outline" onClick={() => navigate(-1)}>
            Go back
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
