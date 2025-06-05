from rest_framework.pagination import CursorPagination

class ChatCursorPagination(CursorPagination):
    page_size = 20 # 20 items per page
    ordering = '-created' # default ordering, but override here

